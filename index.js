const utils = document.parcial2_AP.utils;

((Utils) => {
    const App = {
        htmlElements: {
            pokeapiForm: document.querySelector("#pokeapi-form"),
            pokeapiSearchType: document.querySelector(
                "#pokeapi-type"
            ),
            pokeapiInputSearch: document.querySelector("#pokeapi-input-search"),
            pokeapiOutput: document.querySelector("#pokeapi-output"),
            limpiarPokeapiBtn: document.querySelector("#pokeapi-limpiar-btn"),
        },
        init: () => {
            App.htmlElements.pokeapiForm.addEventListener(
                "submit",
                App.handlers.onSubmitPokeapiForm
            );
            App.htmlElements.limpiarPokeapiBtn.addEventListener(
                "click",
                App.handlers.onClickLimpiarPokeapiBtn
            );
        },
        handlers: {
            onSubmitPokeapiForm: async (e) => {
                e.preventDefault();

                const query = App.htmlElements.pokeapiInputSearch?.value;
                const searchType = App.htmlElements.pokeapiSearchType?.value;
                console.log(query, searchType);
                if (!query)
                    return App.htmlElements.pokeapiOutput.innerHTML = `<div class="flat-card-container"><h1>Ingrese algun dato para buscar</h1></div>`;

                console.log({ searchType, query });
                try {
                    //multirequest depending on searchType
                    let response = {};
                    if (searchType === "ability")
                        response = await Utils.getAbility({ nameOrId: query.toLowerCase() })
                    else//default
                        response = await Utils.getPokemon({ nameOrId: query.toLowerCase() })

                    console.log(response)
                    //transform the chain object into a readable array:
                    const renderedTemplate = App.templates.render({
                        searchType,
                        response,
                    });
                    App.htmlElements.pokeapiOutput.innerHTML = renderedTemplate;
                } catch (error) {
                    App.htmlElements.pokeapiOutput.innerHTML = `<div class="flat-card-container"><h1>${error}</h1></div>`;
                }
            },
            onClickLimpiarPokeapiBtn: (e) => {
                e.preventDefault();
                console.log("clearing");
                //clear fields
                App.htmlElements.pokeapiInputSearch.value = "";
                App.htmlElements.pokeapiSearchType.value = "";
                //clear resulting output
                App.htmlElements.pokeapiOutput.innerHTML = "";
            },
        },
        templates: {
            render: ({ searchType, response }) => {
                const renderMap = {
                    ability: App.templates.whoCanLearnAbilityCard,
                    pokemon: App.templates.pokemonCard,
                };
                return renderMap[searchType]
                    ? renderMap[searchType](response)
                    : App.templates.errorCard();
            },
            errorCard: () => `<h1>There was an error</h1>`,
            pokemonCard: ({ id, name, weight, height, sprites, abilities, evolutionChain }) => {
                return `<div class="flat-card-container">
                            ${App.templates.nameCard({ name, id })}
                            ${App.templates.sprites({ sprites })}
                            ${App.templates.weightHeight({ weight, height })}
                            ${App.templates.evolutionChain({ evolutionChain })} 
                            ${App.templates.abilities({ abilities })}
                        </div>`
            },
            whoCanLearnAbilityCard: ({ name, pokemon }) =>
                `<div class="flat-card-container">
                    <div class="w100 mt">
                        <h1>${Utils.capitalize(name)}</h1>
                        ${App.templates.whoCanLearn({ pokemon })}
                    </div>
                </div>`,
            whoCanLearn: ({ pokemon }) =>
                `<ul>
                    ${pokemon.map((p) => `<li>${Utils.capitalize(p.pokemon.name)} ${p?.is_hidden ? App.templates.iconHidden() : ""}</li>`).join("")}
                </ul>`,
            nameCard: ({ name, id }) =>
                `<div class="w100 mt">
                    <h1>${Utils.capitalize(name)} (${id})</h1>
                </div > `,
            sprites: ({ sprites }) =>
                `<div class="w48 mt">
                    <h1>Sprites</h1>
                    <div class="pokeapi-sprites">
                    ${Object.entries(sprites)
                    .filter(([name, link]) => link !== null && ['front_default', 'back_default'].includes(name))
                    .sort((a, b) => a[0].includes("front") ? -1 : 1)
                    .map(([name, link]) => `<div class="pokeapi-sprite-container">
                                        <img class="pokeapi-sprite-img" src="${link}" alt="${name}" />
                                        <!--<p class="pokeapi-sprite-name">${name.replace(/\_/gi, " ")}</p>-->
                                    </div>`)
                    .join("")}
                </div>
            </div> `,
            weightHeight: ({ weight, height }) =>
                `<div class="w48 mt" >
                    <h1> Weight / Height</h1>
                    <p > ${weight} / ${height}</p>
                </div > `,
            abilities: ({ abilities }) =>
                `<div class="w48 mt" >
        <h1>Abilities</h1>
                    ${!abilities?.length ? "No abilities" :
                    `<ul>
                        ${abilities
                        .map(ability => `<li>${ability.ability.name} ${ability?.is_hidden ? App.templates.iconHidden() : ""}</li>`)
                        .join("")}
                    </ul>`  }
                </div > `,
            evolutionChain: ({ evolutionChain }) =>
                `<div class="w48 mt" >
                    <h1>Evolution Chain</h1>
                        ${!evolutionChain?.length ? "No evolution chain" :
                    `<ul>
                            ${evolutionChain
                        .map(evolution =>
                            `<li>
                                    ${Utils.capitalize(evolution.name)} ${evolution?.isBaby ? App.templates.iconBaby() : ""}
                                </li>`)
                        .join("")}
                        </ul>`  }
                </div > `,
            iconHidden: () => `<img src = "./assets/svg/eye.svg" > `,
            iconBaby: () => `<img src = "./assets/svg/baby.svg" > `,
        },
    };
    App.init();
})(utils);