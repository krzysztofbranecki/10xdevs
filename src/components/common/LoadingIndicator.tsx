export const LoadingIndicator = () => {
  return (
    <div className="flex justify-center items-center" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
