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

  shellHook = '''';

  packages = [
    cargo
    nodejs_22
  ];
}
