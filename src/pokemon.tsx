import React, { useState, useEffect } from 'react';

const PokemonStudyTimer = () => {
  const [initialTime, setInitialTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [pokemon, setPokemon] = useState(null);
  const [caughtPokemon, setCaughtPokemon] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPokedex, setShowPokedex] = useState(false);

  useEffect(() => {
    const savedPokemon = localStorage.getItem('caughtPokemon');
    if (savedPokemon) {
      setCaughtPokemon(JSON.parse(savedPokemon));
    }
  }, []);

  useEffect(() => {
    if (caughtPokemon.length > 0) {
      localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
    }
  }, [caughtPokemon]);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      getPokemon();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeInput = (e, type) => {
    const value = parseInt(e.target.value) || 0;
    if (type === 'minutes') {
      setInitialTime(value * 60 + (timeLeft % 60));
      setTimeLeft(value * 60 + (timeLeft % 60));
    } else {
      setInitialTime(Math.floor(timeLeft / 60) * 60 + value);
      setTimeLeft(Math.floor(timeLeft / 60) * 60 + value);
    }
  };

  const resetTimer = () => {
    setTimeLeft(initialTime);
    setIsRunning(false);
    setPokemon(null);
    setError(null);
  };

  const getPokemon = async () => {
    setLoading(true);
    setError(null);
    try {
      const id = Math.floor(Math.random() * 151) + 1;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await response.json();
      const newPokemon = {
        id: data.id,
        name: data.name,
        types: data.types.map((t) => t.type.name),
        image: data.sprites.front_default,
        captureDate: new Date().toLocaleDateString(),
      };
      setPokemon(newPokemon);
      setCaughtPokemon((prev) => [...prev, newPokemon]);
    } catch (err) {
      setError('ポケモンの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const sortedPokemon = [...caughtPokemon].sort((a, b) => a.id - b.id);

  const Pokedex = () => (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden'>
        <div className='p-4 border-b flex justify-between items-center'>
          <div className='text-2xl font-bold text-gray-600'>ポケモン図鑑</div>
          <button
            className='text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-2'
            onClick={() => setShowPokedex(false)}
          >
            閉じる
          </button>
        </div>
        <div className='p-4 overflow-y-auto max-h-[calc(80vh-80px)]'>
          {caughtPokemon.length === 0 ? (
            <p className='text-center text-gray-500'>
              まだポケモンを捕まえていません
            </p>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {sortedPokemon.map((pokemon, index) => (
                <div
                  key={`${pokemon.id}-${index}`}
                  className='bg-white rounded-lg shadow p-4'
                >
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    className='w-32 h-32 mx-auto'
                  />
                  <div className='text-center'>
                    <h3 className='text-lg font-bold text-gray-600 capitalize'>
                      No.{String(pokemon.id).padStart(3, '0')} {pokemon.name}
                    </h3>
                    <div className='flex gap-2 justify-center mt-2'>
                      {pokemon.types.map((type, idx) => (
                        <span
                          key={idx}
                          className='px-2 py-1 bg-blue-100 rounded-full text-sm'
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                    <div className='text-sm text-gray-500 mt-2'>
                      捕まえた日: {pokemon.captureDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className='p-4'>
      <div className='bg-white rounded-lg shadow'>
        <div className='p-4 border-b'>
          <h2 className='text-2xl font-bold text-gray-600 text-center'>
            - timer -
          </h2>
          <div className='text-2xl font-bold text-gray-600 text-center'>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className='p-4 flex items-center justify-center'>
          <div>
            <div className='flex justify-center gap-2 items-center'>
              <input
                type='number'
                min='1'
                placeholder='0'
                className='w-20 border rounded-lg text-center p-2'
                onChange={(e) => handleTimeInput(e, 'minutes')}
                disabled={isRunning}
              />
              <p className='text-gray-600'>分</p>
              <input
                type='number'
                min='0'
                max='59'
                placeholder='00'
                className='w-20 border rounded-lg text-center p-2'
                onChange={(e) => handleTimeInput(e, 'seconds')}
                disabled={isRunning}
              />
              <p className='text-gray-600'>秒</p>
            </div>
            <div className='flex justify-center gap-2 mt-4'>
              <button
                className={`px-4 py-2 border rounded-lg ${
                  timeLeft === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setIsRunning(!isRunning)}
                disabled={timeLeft === 0}
              >
                {isRunning ? '一時停止' : 'スタート'}
              </button>
              <button
                className='px-4 py-2 border rounded-lg hover:bg-gray-50'
                onClick={resetTimer}
              >
                リセット
              </button>
              <button
                className='px-4 py-2 border rounded-lg hover:bg-gray-50'
                onClick={() => setShowPokedex(true)}
              >
                図鑑
              </button>
            </div>
            {loading && (
              <div className='text-xl font-bold text-gray-600 text-center mt-4 animate-pulse'>
                ポケモンを捕まえています...
              </div>
            )}
            {error && (
              <div className='text-center text-red-500 mt-4'>
                {error}
                <button
                  className='block mx-auto mt-2 px-4 py-2 border rounded-lg hover:bg-gray-50'
                  onClick={getPokemon}
                >
                  再試行
                </button>
              </div>
            )}
            {pokemon && !loading && (
              <div className='text-center mt-4'>
                <img
                  src={pokemon.image}
                  alt={pokemon.name}
                  className='w-32 h-32 mx-auto'
                />
                <h3 className='text-xl font-bold text-gray-600 capitalize'>
                  No.{String(pokemon.id).padStart(3, '0')} {pokemon.name}
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
      {showPokedex && <Pokedex />}
    </div>
  );
};

export default PokemonStudyTimer;
