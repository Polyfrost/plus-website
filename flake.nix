{
    inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
        flake-utils.url = "github:numtide/flake-utils";
    };

    outputs = { self, nixpkgs, flake-utils, ... }:
        flake-utils.lib.eachDefaultSystem (system: let
            # Initialize nixpkgs
            pkgs = nixpkgs.legacyPackages.${system};
        in {
            packages = {
                default = self.packages.${system}.plus-website;
                plus-website = pkgs.callPackage ./nix/package.nix {};
            };
            devShells.default = pkgs.mkShellNoCC {
                # Add all build-time dependencies to the environment
                packages = [
                    pkgs.nodejs
                ];
            };
        }) // {
            hydraJobs.build = self.packages.x86_64-linux.plus-website;
        };
}
