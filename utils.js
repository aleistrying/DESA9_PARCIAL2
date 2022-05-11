
(() => {
    const Utils = {
        config: {
            backendBaseUrl: "https://pokeapi.co/api/v2",
        },
        getFormattedBackendUrl: ({ query, searchType }) => {
            return `${Utils.config.backendBaseUrl}/${searchType}/${query}`;
        },
        getAbility: ({ nameOrId }) => {
            const searchType = "ability";
            return Utils.fetch({
                url: Utils.getFormattedBackendUrl({ query: nameOrId.replace(" ", "-"), searchType }),
                searchType,
            });
        },
        getPokemon: async ({ nameOrId }) => {
            const searchType = "pokemon";
            try {
                const speciesResponse = await Utils.fetch({
                    url: Utils.getFormattedBackendUrl({
                        query: nameOrId,
                        searchType: "pokemon-species"
                    }),
                    searchType: "pokemon-species",
                });
                //from species, get evolution chain
                const [response, chain] = await Promise.all([
                    Utils.fetch({
                        url: Utils.getFormattedBackendUrl({
                            query: nameOrId,
                            searchType,
                        }),
                        searchType,
                    }),
                    Utils.fetch({
                        url: speciesResponse?.evolution_chain?.url,
                        searchType: "evolution-chain",
                    }).catch((e) => {
                        console.log("No chain found for species found for this pokemon");
                        return {};
                    })
                ]);
                if (chain?.chain)
                    response.evolutionChain = Utils.deconstructPokemonChain({
                        initialPokemon: chain?.chain
                    })
                return response;
            } catch (e) {
                // console.log(e)
                throw new Error(`No pokemon found`);
            }
        },
        fetch: async ({ url, searchType }) => {
            try {
                const rawResponse = await fetch(url);
                if (rawResponse.status !== 200) {
                    throw new Error(`${searchType} not found`);
                }
                return rawResponse.json();
            } catch (error) {
                throw error;
            }
        },
        // pokemon: { evolves_to:[pokemon,pokemon,pokemon], species:{}}
        deconstructPokemonChain: ({ initialPokemon }) => {

            //closing condition
            if (!initialPokemon.evolves_to?.length)
                return {
                    name: initialPokemon.species.name,
                    isBaby: initialPokemon.is_baby
                };

            return [{
                name: initialPokemon.species.name,
                isBaby: initialPokemon.is_baby
            },
            ...initialPokemon.evolves_to.map(pokemon => {
                let pokemons = Utils.deconstructPokemonChain({
                    initialPokemon: pokemon
                })

                //if it's an array flat it
                if (pokemons?.length)
                    return pokemons

                return pokemons
            })].flat()
        },
        capitalize: (s) => {
            if (!s || typeof s !== "string") return s;
            return s.replace(/\b\w/g, c => c.toUpperCase());
        }
    };
    document.parcial2_AP = { utils: Utils };
})()