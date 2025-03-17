use serde::{Deserialize, Serialize};
use serde_json;
use serde_valid::Validate;
use uuid::Uuid;
use worker::*;

#[derive(Deserialize, Serialize, Validate)]
pub struct Secret {
    #[serde(with = "serde_bytes")]
    iv: [u8; 16],
    #[serde(with = "serde_bytes")]
    #[validate(min_items = 1)]
    #[validate(max_items = 32768)]
    ciphertext: Vec<u8>,
}

#[derive(Deserialize, Serialize)]
pub struct SecretId {
    id: Uuid,
}

fn cors_headers() -> Cors {
    Cors::new()
        .with_origins(vec!["https://secrets.neal.codes"])
        .with_allowed_headers(vec!["content-type"])
        .with_methods(vec![Method::Options, Method::Post])
}

fn response() -> Result<ResponseBuilder> {
    ResponseBuilder::new().with_cors(&cors_headers())
}

async fn handle_options(_req: Request) -> Result<Response> {
    Ok(response()?.empty())
}

const KV_NAMESPACE: &str = "secrets";

#[event(fetch, respond_with_errors)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    console_error_panic_hook::set_once();

    let router = Router::new();

    router
        .options_async("/retrieve", |req, _ctx| handle_options(req))
        .post_async("/retrieve", |mut req, ctx| async move {
            let payload = match req.json::<SecretId>().await {
                Ok(p) => p,
                Err(e) => return response()?.error(e.to_string(), 400),
            };

            let kv = ctx.kv(&KV_NAMESPACE)?;
            let bytes = kv.get(&payload.id.to_string()).bytes().await?;
            if bytes.is_none() {
                return response()?.error("Secret not found", 404);
            }
            kv.delete(&payload.id.to_string()).await?;
            let secret: Secret = serde_json::from_slice(&bytes.unwrap())?;
            response()?.from_json(&secret)
        })
        .options_async("/store", |req, _ctx| handle_options(req))
        .post_async("/store", |mut req, ctx| async move {
            let payload = match req.json::<Secret>().await {
                Ok(p) => p,
                Err(e) => return response()?.error(e.to_string(), 400),
            };
            let validation = payload.validate().map_err(|e| e.to_string());
            if validation.is_err() {
                return response()?.error(validation.err().unwrap(), 400);
            }

            let kv = ctx.kv(&KV_NAMESPACE)?;
            let id = Uuid::new_v4();
            let bytes = serde_json::to_vec(&payload)?;
            kv.put_bytes(&id.to_string(), &bytes)?
                .expiration_ttl(60 * 60 * 24)
                .execute()
                .await?;
            response()?.from_json(&SecretId { id })
        })
        .run(req, env)
        .await
}
