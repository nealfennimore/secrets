{
  pkgs ? import <nixpkgs> { },
}:
with pkgs;
mkShell {
  buildInputs = [
    openssl
  ];

  nativeBuildInputs = [
    pkg-config
  ];

  shellHook = '''';

  packages = [
    nodejs
    rustup
    rustc
    cargo
    openssl
  ];
}
