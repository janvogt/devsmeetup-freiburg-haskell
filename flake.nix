{
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-25.05";
    utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, utils }:
    utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        hpgkgs = pkgs.haskell.packages.ghc910;
      in {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            hpgkgs.ghc
            hpgkgs.haskell-language-server
            hpgkgs.cabal-gild
            hpgkgs.doctest
            # The following is necessary for hls, since it appears not to respect build-tool-depends
            hpgkgs.tasty-autocollect
            nodejs
            cabal-install
            ghcid
          ];
        };
      });
}
