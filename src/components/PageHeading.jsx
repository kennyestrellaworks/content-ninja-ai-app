export const PageHeading = ({ h1, p }) => {
  return (
    <header className="text-center mb-12">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{h1}</h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">{p}</p>
    </header>
  );
};
