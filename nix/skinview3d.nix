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
        rev = "e1444ea37fbdf8b36acf08f653569d5789b4004c";
        hash = "sha256-EwkcXXLZzbJ81CvNP5xDy7cckuUr+6TO/eFHXlBYjxY=";
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
