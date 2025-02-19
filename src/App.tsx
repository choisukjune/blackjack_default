import React, { useState, useEffect } from 'react';
import { Spade, Heart, Diamond, Club, RefreshCw } from 'lucide-react';

type Card = {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  numericValue: number;
};

type GameState = 'betting' | 'playing' | 'dealerTurn' | 'gameOver';

function App() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [chips, setChips] = useState(1000);
  const [bet, setBet] = useState(0);
  const [message, setMessage] = useState('Place your bet!');

  const createDeck = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const newDeck: Card[] = [];

    for (const suit of suits) {
      for (const value of values) {
        let numericValue = parseInt(value);
        if (['J', 'Q', 'K'].includes(value)) numericValue = 10;
        if (value === 'A') numericValue = 11;
        newDeck.push({ suit, value, numericValue });
      }
    }

    return shuffle(newDeck);
  };

  const shuffle = (array: Card[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const dealCards = () => {
    if (bet <= 0 || bet > chips) {
      setMessage('Please place a valid bet!');
      return;
    }

    const newDeck = createDeck();
    const pHand = [newDeck[0], newDeck[1]];
    const dHand = [newDeck[2], newDeck[3]];
    
    setDeck(newDeck.slice(4));
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameState('playing');
    setMessage('Your turn! Hit or Stand?');
  };

  const calculateHandValue = (hand: Card[]) => {
    let value = 0;
    let aces = 0;

    for (const card of hand) {
      if (card.value === 'A') {
        aces += 1;
      } else {
        value += card.numericValue;
      }
    }

    for (let i = 0; i < aces; i++) {
      if (value + 11 <= 21) {
        value += 11;
      } else {
        value += 1;
      }
    }

    return value;
  };

  const hit = () => {
    if (gameState !== 'playing') return;

    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck(deck.slice(1));

    if (calculateHandValue(newHand) > 21) {
      setGameState('gameOver');
      setMessage('Bust! You lose!');
      setChips(chips - bet);
    }
  };

  const stand = () => {
    setGameState('dealerTurn');
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];
    
    while (calculateHandValue(currentDealerHand) < 17) {
      currentDealerHand.push(currentDeck[0]);
      currentDeck = currentDeck.slice(1);
    }

    setDealerHand(currentDealerHand);
    setDeck(currentDeck);

    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(currentDealerHand);

    let result = '';
    if (dealerValue > 21) {
      result = 'Dealer busts! You win!';
      setChips(chips + bet);
    } else if (dealerValue > playerValue) {
      result = 'Dealer wins!';
      setChips(chips - bet);
    } else if (playerValue > dealerValue) {
      result = 'You win!';
      setChips(chips + bet);
    } else {
      result = 'Push!';
    }

    setMessage(result);
    setGameState('gameOver');
  };

  const placeBet = (amount: number) => {
    if (gameState !== 'betting') return;
    if (amount > chips) return;
    setBet(amount);
  };

  const resetGame = () => {
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setDeck([]);
    setBet(0);
    setMessage('Place your bet!');
  };

  const getSuitIcon = (suit: string) => {
    switch (suit) {
      case 'hearts':
        return <Heart className="text-red-500" />;
      case 'diamonds':
        return <Diamond className="text-red-500" />;
      case 'clubs':
        return <Club className="text-gray-900" />;
      case 'spades':
        return <Spade className="text-gray-900" />;
    }
  };

  const renderCard = (card: Card) => (
    <div className="w-24 h-36 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-between p-2 m-2">
      <div className="text-xl font-bold">{card.value}</div>
      <div className="w-8 h-8">{getSuitIcon(card.suit)}</div>
      <div className="text-xl font-bold rotate-180">{card.value}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-green-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-white text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Blackjack</h1>
          <p className="text-xl">Chips: ${chips}</p>
          {gameState === 'betting' && (
            <div className="mt-4 space-x-4">
              <button
                onClick={() => placeBet(10)}
                className="bg-yellow-500 text-black px-4 py-2 rounded-full hover:bg-yellow-400"
              >
                Bet $10
              </button>
              <button
                onClick={() => placeBet(25)}
                className="bg-yellow-500 text-black px-4 py-2 rounded-full hover:bg-yellow-400"
              >
                Bet $25
              </button>
              <button
                onClick={() => placeBet(50)}
                className="bg-yellow-500 text-black px-4 py-2 rounded-full hover:bg-yellow-400"
              >
                Bet $50
              </button>
            </div>
          )}
          {bet > 0 && gameState === 'betting' && (
            <div className="mt-4">
              <p className="mb-2">Current Bet: ${bet}</p>
              <button
                onClick={dealCards}
                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-400"
              >
                Deal Cards
              </button>
            </div>
          )}
        </div>

        {gameState !== 'betting' && (
          <>
            <div className="mb-8">
              <h2 className="text-white text-xl mb-2">Dealer's Hand ({calculateHandValue(dealerHand)})</h2>
              <div className="flex flex-wrap">
                {dealerHand.map((card, index) => (
                  <div key={index}>{renderCard(card)}</div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-white text-xl mb-2">Your Hand ({calculateHandValue(playerHand)})</h2>
              <div className="flex flex-wrap">
                {playerHand.map((card, index) => (
                  <div key={index}>{renderCard(card)}</div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="text-white text-xl mb-4">{message}</p>
              {gameState === 'playing' && (
                <div className="space-x-4">
                  <button
                    onClick={hit}
                    className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-400"
                  >
                    Hit
                  </button>
                  <button
                    onClick={stand}
                    className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-400"
                  >
                    Stand
                  </button>
                </div>
              )}
              {gameState === 'gameOver' && (
                <button
                  onClick={resetGame}
                  className="bg-purple-500 text-white px-6 py-2 rounded-full hover:bg-purple-400 inline-flex items-center"
                >
                  <RefreshCw className="mr-2" /> Play Again
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;