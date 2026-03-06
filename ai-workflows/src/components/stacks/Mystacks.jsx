import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './MyStacks.css';


const StackCard = ({ stack, onClick }) => (
  <div className="stack-card" onClick={() => onClick(stack.id)}>
    <p className="stack-card__title">{stack.name}</p>
    <p className="stack-card__meta">Created {stack.createdAt}</p>
  </div>
);


const MyStacks = () => {
  const navigate = useNavigate();

  const [stacks, setStacks] = useState([]);

  const handleNewStack = () => {
    navigate('/builder');
  };

  const handleStackClick = (id) => {
    navigate(`/builder/${id}`);
  };

  return (
    <>
      <Navbar userInitial="S" />

      <main className="my-stacks">
        <div className="my-stacks__header">
          <h1 className="my-stacks__title">My Stacks</h1>
          <button className="my-stacks__new-btn" onClick={handleNewStack}>
            + New Stack
          </button>
        </div>

        {stacks.length === 0 ? (
          <div className="my-stacks__empty">
            <div className="my-stacks__empty-card">
              <h2 className="my-stacks__empty-title">Create New Stack</h2>
              <p className="my-stacks__empty-desc">
                Start building your generative AI apps with our essential tools
                and frameworks
              </p>
              <button className="my-stacks__empty-btn" onClick={handleNewStack}>
                + New Stack
              </button>
            </div>
          </div>
        ) : (
          <div className="my-stacks__grid">
            {stacks.map((stack) => (
              <StackCard
                key={stack.id}
                stack={stack}
                onClick={handleStackClick}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default MyStacks;