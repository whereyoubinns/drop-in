import { useState, FormEvent } from 'react';

interface AddPlayerFormProps {
  onAddPlayer: (name: string) => void;
}

export const AddPlayerForm = ({ onAddPlayer }: AddPlayerFormProps) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddPlayer(name);
      setName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-player-form">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter player name"
        className="player-input"
        autoFocus
      />
      <button type="submit" className="btn btn-primary">
        Add
      </button>
    </form>
  );
};
