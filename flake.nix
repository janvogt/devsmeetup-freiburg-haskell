{
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-25.05";
    utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, utils }:
    utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        hpgkgs = pkgs.haskell.packages.ghc912;
      in {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            hpgkgs.ghc
            hpgkgs.haskell-language-server
            nodejs
            cabal-install
            ghcid
          ];
        };
      });
}
