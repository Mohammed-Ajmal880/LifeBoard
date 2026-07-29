import './Arena.css';

function ArenaBackground({ children }) {
  return (
    <div className="arena-container">
      {/* Visual Background Elements */}
      <div className="arena-grid" />
      <div className="arena-platform-opponent" />
      <div className="arena-platform-player" />

      {/* 
        This lets you inject your sprites, HP bars, and UI layers 
        directly inside the container from your parent component 
      */}
      {children}
    </div>
  );
}

export default ArenaBackground;