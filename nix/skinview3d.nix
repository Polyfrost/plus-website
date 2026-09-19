{
    lib,
    buildNpmPackage,
    fetchFromGitHub,
}:
# skinview3d is consumed as a git dependency, which npm would normally build by
# running its `prepare` script on install. buildNpmPackage installs with
# `--ignore-scripts`, so that never happens and the package ends up without the
# `libs/` directory its `main`/`types` point at. Build it separately instead.
buildNpmPackage rec {
    pname = "skinview3d";
    version = "3.4.2";

    src = fetchFromGitHub {
        owner = "Polyfrost";
        repo = "skinview3d";
        rev = "6a4d27309f1720220a0a91d09e81a27310201348";
        hash = "sha256-GE/cCBUzXJ/zsXtISkAwBQqxTCidEIlITNmb4QnKU1c=";
    };

    npmDepsHash = "sha256-YT9eHZ0jqelLz0+f4rHRsJyMH95ZmPIMJvxbGbeTbsw=";

    # `prepare` is what npm itself would run on install: it builds `libs/` and
    # `bundles/`. The default `build` script also builds the vite preview site,
    # which is not needed here.
    npmBuildScript = "prepare";

    installPhase = ''
        runHook preInstall

        mkdir -p "$out"
        cp -r package.json libs bundles "$out"/

        runHook postInstall
    '';

    meta = {
        description = "Three.js powered Minecraft skin viewer (Polyfrost fork)";
        homepage = "https://github.com/Polyfrost/skinview3d";
        license = lib.licenses.mit;
    };
}
