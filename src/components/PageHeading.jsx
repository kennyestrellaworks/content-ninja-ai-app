import boyNinja from "../assets/boy-ninja.png";

export const PageHeading = ({ h1, p }) => {
  return (
    <header className="flex flex-col items-center text-center mb-8 px-2 sm:px-0">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
        <img src={boyNinja} alt="Boy Ninja Master of Content" />
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 mt-3">
        {h1}
      </h1>
      <p className="text-base sm:text-lg text-gray-600 max-w-xl md:max-w-2xl mx-auto">
        {p}
      </p>
    </header>
  );
};
