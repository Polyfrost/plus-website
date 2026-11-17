{
    # nixpkgs dependencies
    lib,
    buildNpmPackage,
    nodejs,
    nodejs-slim,
    makeBinaryWrapper,

    # overridables
    # Points at the plus backend. Staging overrides this with
    # https://plus-staging.polyfrost.org.
    backendUrl ? "https://plus.polyfrost.org",
    originalSrc ? ./..,
}:
let
    src = lib.sources.cleanSourceWith {
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
in
buildNpmPackage {
    pname = "plus-website";
    version = "0";

    inherit src;

    npmDepsHash = "sha256-qcwMv6cp6GNOXr2q3QF5KKtjWorybi7MJWo+AmRnuEU=";

    # nodejs-slim ships no npm, so build with the full nodejs. Only the runtime
    # wrapper below uses nodejs-slim, keeping it out of the runtime closure.
    inherit nodejs;

    nativeBuildInputs = [
        makeBinaryWrapper
    ];

    env = {
        NEXT_TELEMETRY_DISABLED = "1";

        # NOTE: next inlines NEXT_PUBLIC_* vars into the client bundle at build
        # time, so this is baked in and cannot be changed at runtime. Override
        # the package to change it.
        NEXT_PUBLIC_BACKEND_URL = backendUrl;
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
