use serde::{Deserialize, Serialize};
use serde_json;
use uuid::Uuid;
use worker::*;

#[derive(Deserialize, Serialize)]
struct Secret {
    #[serde(with = "serde_bytes")]
    salt: [u8; 32],
    #[serde(with = "serde_bytes")]
    ciphertext: Vec<u8>,
}

#[derive(Deserialize, Serialize)]
struct SecretId {
    id: String,
}

const KV_NAMESPACE: &str = "SECRETS";

#[event(fetch, respond_with_errors)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    console_error_panic_hook::set_once();

    let router = Router::new();

    router
        .post_async("/retrieve", |mut req, ctx| async move {
            let kv = ctx.kv(&KV_NAMESPACE)?;
            let payload = req.json::<SecretId>().await?;
            let bytes = kv.get(&payload.id).bytes().await?.expect("No secret found");
            let secret: Secret = serde_json::from_slice(&bytes)?;
            Response::from_json(&secret)
        })
        .post_async("/store", |mut req, ctx| async move {
            let kv = ctx.kv(&KV_NAMESPACE)?;
            let id: String = Uuid::new_v4().urn().to_string();
            let payload = req.json::<Secret>().await?;
            let bytes = serde_json::to_vec(&payload)?;
            kv.put_bytes(&id, &bytes)?.execute().await?;
            Response::from_json(&SecretId { id })
        })
        .run(req, env)
        .await
}
