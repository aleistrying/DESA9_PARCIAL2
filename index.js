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

                if (App.htmlElements.limpiarPokeapiBtn.classList.contains("hidden"))
                    App.htmlElements.limpiarPokeapiBtn.classList.remove("hidden");

                const query = App.htmlElements.pokeapiInputSearch?.value;
                const searchType = App.htmlElements.pokeapiSearchType?.value;
                // console.log(query, searchType);
                if (!query)
                    return App.htmlElements.pokeapiOutput.innerHTML = `<div class="flat-card-container"><h1>Ingrese algún dato para buscar</h1></div>`;
                if (!searchType)
                    return App.htmlElements.pokeapiOutput.innerHTML = `<div class="flat-card-container"><h1>Ingrese algún tipo de búsqueda</h1></div>`;

                // console.log({ searchType, query });
                try {
                    //multirequest depending on searchType
                    let response = {};
                    if (searchType === "ability")
                        response = await Utils.getAbility({ nameOrId: query.toLowerCase() })
                    else//default
                        response = await Utils.getPokemon({ nameOrId: query.toLowerCase() })

                    // console.log(response)
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

                if (App.htmlElements.limpiarPokeapiBtn.classList.contains("hidden"))
                    return;
                // console.log("clearing");
                //clear fields
                App.htmlElements.pokeapiInputSearch.value = "";
                App.htmlElements.pokeapiSearchType.value = "";
                //clear resulting output
                App.htmlElements.pokeapiOutput.innerHTML = "";
                App.htmlElements.limpiarPokeapiBtn.classList.add("hidden");
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
                    <div class="w100 inner-container-fix">
                        <h3 class="pokeapi-pokemon-name-title">${Utils.capitalize(name).replace("-", " ")}</h3>
                        <h4 class="pokeapi-pokemon-title mt">Who can learn it?</h4>
                        ${App.templates.whoCanLearn({ pokemon })}
                    </div>
                </div>`,
            whoCanLearn: ({ pokemon }) =>
                `<ul>
                    ${pokemon.map((p) => `<li><div class="li-item-container">${Utils.capitalize(p.pokemon.name)} ${p?.is_hidden ? App.templates.iconHidden() : ""}</div></li>`).join("")}
                </ul>`,
            nameCard: ({ name, id }) =>
                `<div class="w100 ">
                    <h2 class="pokeapi-pokemon-name-title">${Utils.capitalize(name)} (${id})</h2>
                </div > `,
            sprites: ({ sprites }) =>
                `<div class="w48 mt">
                    <h3 class="pokeapi-pokemon-title">Sprites</h3>
                    <div class="pokeapi-sprites">
                    ${Object.entries(sprites)
                    .filter(([name, link]) => link !== null && ['front_default', 'back_default'].includes(name))
                    .sort((a, b) => a[0].includes("front") ? -1 : 1)
                    .map(([name, link]) => `<div class="pokeapi-sprite-container">
                                        <div class="pokeapi-sprite-img-container"><img class="pokeapi-sprite-img" src="${link}" alt="${name}" /></div>
                                        <!--<p class="pokeapi-sprite-name">${name.replace(/\_/gi, " ")}</p>-->
                                    </div>`)
                    .join("")}
                </div>
            </div> `,
            weightHeight: ({ weight, height }) =>
                `<div class="w48 mt" >
                    <h3 class="pokeapi-pokemon-title"> Weight / Height</h3>
                    <p> ${weight} / ${height}</p>
                </div > `,
            abilities: ({ abilities }) =>
                `<div class="w48 mt" >
        <h3 class="pokeapi-pokemon-title">Abilities</h3>
                    ${!abilities?.length ? "No abilities" :
                    `<ul>
                        ${abilities
                        .map(ability => `<li><div class="li-item-container">${Utils.capitalize(ability.ability.name)} ${ability?.is_hidden ? App.templates.iconHidden() : ""}</div></li>`)
                        .join("")}
                    </ul>`  }
                </div > `,
            evolutionChain: ({ evolutionChain }) =>
                `<div class="w48 mt" >
                    <h3 class="pokeapi-pokemon-title">Evolution Chain</h3>
                        ${!evolutionChain?.length ? "No evolution chain" :
                    `<ul>
                            ${evolutionChain
                        .map(evolution =>
                            `<li>
<div class="li-item-container">
                                    ${Utils.capitalize(evolution.name)} ${evolution?.isBaby ? App.templates.iconBaby() : ""}
                                    </div>
                                </li>`)
                        .join("")}
                        </ul>`  }
                </div > `,
            iconHidden: () => `<img class="pokeapi-icon" src = "./assets/svg/eye.svg" > `,
            iconBaby: () => `<img class="pokeapi-icon" src = "./assets/svg/baby.svg" > `,
        },
    };
    App.init();
})(utils);