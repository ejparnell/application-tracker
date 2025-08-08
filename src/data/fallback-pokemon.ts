// Fallback Pokemon data when PokeAPI is unavailable
export const fallbackPokemon = [
  {
    id: 1,
    name: "bulbasaur",
    sprites: {
      front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
      other: {
        "official-artwork": {
          front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png"
        }
      }
    },
    types: [{ type: { name: "grass" } }, { type: { name: "poison" } }],
    height: 7,
    weight: 69
  },
  {
    id: 4,
    name: "charmander",
    sprites: {
      front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
      other: {
        "official-artwork": {
          front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png"
        }
      }
    },
    types: [{ type: { name: "fire" } }],
    height: 6,
    weight: 85
  },
  {
    id: 7,
    name: "squirtle",
    sprites: {
      front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
      other: {
        "official-artwork": {
          front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png"
        }
      }
    },
    types: [{ type: { name: "water" } }],
    height: 5,
    weight: 90
  },
  {
    id: 25,
    name: "pikachu",
    sprites: {
      front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
      other: {
        "official-artwork": {
          front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
        }
      }
    },
    types: [{ type: { name: "electric" } }],
    height: 4,
    weight: 60
  },
  {
    id: 150,
    name: "mewtwo",
    sprites: {
      front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png",
      other: {
        "official-artwork": {
          front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png"
        }
      }
    },
    types: [{ type: { name: "psychic" } }],
    height: 20,
    weight: 1220
  }
];

export const fallbackGeneration = {
  id: 1,
  name: "generation-i",
  pokemon: fallbackPokemon
};
