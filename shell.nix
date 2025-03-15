{
  pkgs ? import <nixpkgs> { },
}:
with pkgs;
mkShell {
  RUST_SRC_PATH = "${rust.packages.stable.rustPlatform.rustLibSrc}";

  buildInputs = [
    openssl
    rustup
    rustc
    rustfmt
    cargo
  ];

  nativeBuildInputs = [
    pkg-config
  ];

  shellHook = ''
    export RUSTFLAGS='--cfg getrandom_backend="wasm_js"'
  '';

  packages = [
    cargo
    nodejs
  ];
}
