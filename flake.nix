{
  description = "Secrets development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    { self, nixpkgs, rust-overlay }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forEachSystem = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forEachSystem (
        system:
        let
          pkgs = import nixpkgs {
            inherit system;
            overlays = [ rust-overlay.overlays.default ];
          };
          rustToolchain = pkgs.rust-bin.stable."1.88.0".default.override {
            extensions = [ "rust-src" "rustfmt" ];
            targets = [ "wasm32-unknown-unknown" ];
          };
        in
        {
          default = pkgs.mkShell {
            RUST_SRC_PATH = "${rustToolchain}/lib/rustlib/src/rust/library";

            # `cargo install worker-build` (run by wrangler's build step) drops
            # binaries in CARGO_HOME/bin. Put it on PATH so non-interactive
            # shells (VSCode tasks, wrangler's /bin/sh) can find worker-build.
            shellHook = ''
              export PATH="''${CARGO_HOME:-$HOME/.cargo}/bin:$PATH"
            '';

            buildInputs = with pkgs; [
              openssl
              rustToolchain
            ];

            nativeBuildInputs = with pkgs; [
              pkg-config
            ];

            packages = with pkgs; [
              nodejs_22
              python312
            ];
          };
        }
      );
    };
}
