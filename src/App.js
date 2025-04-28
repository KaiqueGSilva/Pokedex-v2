import { useState, useEffect } from "react";
import "./App.css";

const INITIAL_LIMIT = 8;

function App() {
  const [pokemons, setPokemons] = useState([]);
  // URL inicial com limit definido como 8
  const [nextUrl, setNextUrl] = useState("https://pokeapi.co/api/v2/pokemon?limit=8");
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Função que busca os pokémons pela URL informada
  const fetchPokemons = async (url) => {
    if (!url) return;
    setLoading(true);
    try {
      const response = await fetch(url);
      const data = await response.json();
      setNextUrl(data.next);

      const pokemonData = await Promise.all(
        data.results.map(async (poke) => {
          const res = await fetch(poke.url);
          return await res.json();
        })
      );
      setPokemons((prev) => [...prev, ...pokemonData]);
    } catch (error) {
      console.error("Erro ao buscar pokémons:", error);
    }
    setLoading(false);
  };

  // Buscando os pokémons iniciais
  useEffect(() => {
    fetchPokemons(nextUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Se estiver expandido, mostramos todos os itens carregados; caso contrário, os primeiros INITIAL_LIMIT
  const displayedPokemons = isExpanded ? pokemons : pokemons.slice(0, INITIAL_LIMIT);

  // Altera entre expandir e recolher a lista. Se estiver recolhido e houver somente os 8 iniciais, tenta buscar mais itens.
  const handleToggle = async () => {
    if (!isExpanded) {
      if (pokemons.length === INITIAL_LIMIT && nextUrl) {
        await fetchPokemons(nextUrl);
      }
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Pokédex</h1>
      </header>
      <main className="app-main">
        <div className="pokemon-grid">
          {displayedPokemons.map((pokemon) => (
            <div key={pokemon.id} className="pokemon-card">
              <div className="pokemon-image-container">
                <img
                  src={pokemon.sprites.front_default}
                  alt={pokemon.name}
                />
              </div>
              <h2>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
              <p>{pokemon.types.map((typeInfo) => typeInfo.type.name).join(", ")}</p>
            </div>
          ))}
        </div>
        <div className="control-buttons">
          <button className="toggle-btn" onClick={handleToggle} disabled={loading}>
            {loading ? "Loading..." : (isExpanded ? "Show Less" : "Show More")}
          </button>
          {isExpanded && nextUrl && (
            <button className="load-btn" onClick={() => fetchPokemons(nextUrl)} disabled={loading}>
              {loading ? "Loading..." : "Load More"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
