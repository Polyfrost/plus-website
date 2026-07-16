{
    # nixpkgs dependencies
    lib,
    stdenvNoCC,
    buildNpmPackage,
    nodejs,
    nodejs-slim,
    makeBinaryWrapper,
    callPackage,

    # overridables
    # Points at the plus backend. Staging overrides this with
    # https://plus-staging.polyfrost.org.
    backendUrl ? "https://plus.polyfrost.org",
    originalSrc ? ./..,
    skinview3d ? callPackage ./skinview3d.nix {},
}:
let
    cleanSrc = lib.sources.cleanSourceWith {
        name = "plus-website-src";
        src = lib.sources.cleanSourceWith {
            src = originalSrc;
            filter =
                name: type:
                let
                    baseName = baseNameOf (toString name);
                in
                !(builtins.elem baseName [ ".next" "node_modules" "out" ]);
        };
        filter = lib.sources.cleanSourceFilter;
    };

    # npm resolves the `github:` shorthand to git+ssh, which cannot be fetched
    # inside the build sandbox (no ssh keys). Rewrite it to https.
    src = stdenvNoCC.mkDerivation {
        name = "plus-website-src-patched";
        src = cleanSrc;

        dontBuild = true;
        dontFixup = true;

        installPhase = ''
            runHook preInstall

            cp -r . "$out"
            substituteInPlace "$out"/package-lock.json \
                --replace-fail "git+ssh://git@github.com/" "git+https://github.com/"

            runHook postInstall
        '';
    };
in
buildNpmPackage {
    pname = "plus-website";
    version = "0";

    inherit src;

    npmDepsHash = "sha256-S7Ld+qqdDlHR120sXYycd2WeGo6nj1JwVK29FaCLFWw=";

    # skinview3d is a git dependency, which prefetch-npm-deps refuses unless
    # explicitly allowed (git revs are not content-addressed by npm). npm also
    # insists on repacking it, which needs a writable cache.
    forceGitDeps = true;
    makeCacheWritable = true;

    # nodejs-slim ships no npm, so build with the full nodejs. Only the runtime
    # wrapper below uses nodejs-slim, keeping it out of the runtime closure.
    inherit nodejs;

    nativeBuildInputs = [
        makeBinaryWrapper
    ];

    # npm ci unpacks skinview3d straight from its git tarball, so node_modules
    # only holds its sources. Drop in the built output it would otherwise be
    # missing. See ./skinview3d.nix.
    postConfigure = ''
        cp -r --no-preserve=mode ${skinview3d}/libs node_modules/skinview3d/libs
        cp -r --no-preserve=mode ${skinview3d}/bundles node_modules/skinview3d/bundles
    '';

    env = {
        NEXT_TELEMETRY_DISABLED = "1";

        # NOTE: next inlines `env` entries from next.config.ts into the client
        # bundle at build time, so this is baked in and cannot be changed at
        # runtime. Override the package to change it.
        BACKEND_URL = backendUrl;
    };

    installPhase = ''
        runHook preInstall

        mkdir -p "$out"/{bin,share}

        # `output: "standalone"` emits a self-contained server bundle, but next
        # deliberately leaves static assets out of it, expecting them to be
        # served from a CDN. Put them back so the server can serve them itself.
        cp -r ./.next/standalone/. "$out"/share/
        cp -r ./.next/static "$out"/share/.next/static
        cp -r ./public "$out"/share/public

        makeWrapper ${lib.getExe nodejs-slim} "$out"/bin/start-server \
            --inherit-argv0 \
            --add-flags "$out"/share/server.js

        runHook postInstall
    '';

    meta = {
        mainProgram = "start-server";
        description = "The nodejs code to run polyfrost's plus website";
        homepage = "https://github.com/Polyfrost/plus-website";
        license = lib.licenses.agpl3Only;
    };
}
