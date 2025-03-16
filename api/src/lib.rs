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

const KV_NAMESPACE: &str = "secrets";

#[event(fetch, respond_with_errors)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    console_error_panic_hook::set_once();

    let router = Router::new();

    router
        .post_async("/retrieve", |mut req, ctx| async move {
            let payload = match req.json::<SecretId>().await {
                Ok(p) => p,
                Err(e) => return Response::error(e.to_string(), 400),
            };

            let kv = ctx.kv(&KV_NAMESPACE)?;
            let bytes = kv.get(&payload.id.to_string()).bytes().await?;
            if bytes.is_none() {
                return Response::error("Secret not found", 404);
            }
            kv.delete(&payload.id.to_string()).await?;
            let secret: Secret = serde_json::from_slice(&bytes.unwrap())?;
            Response::from_json(&secret)
        })
        .post_async("/store", |mut req, ctx| async move {
            let payload = match req.json::<Secret>().await {
                Ok(p) => p,
                Err(e) => return Response::error(e.to_string(), 400),
            };
            let validation = payload.validate().map_err(|e| e.to_string());
            if validation.is_err() {
                return Response::error(validation.err().unwrap(), 400);
            }

            let kv = ctx.kv(&KV_NAMESPACE)?;
            let id = Uuid::new_v4();
            let bytes = serde_json::to_vec(&payload)?;
            kv.put_bytes(&id.to_string(), &bytes)?
                .expiration_ttl(60 * 60 * 24)
                .execute()
                .await?;
            Response::from_json(&SecretId { id })
        })
        .run(req, env)
        .await
}
