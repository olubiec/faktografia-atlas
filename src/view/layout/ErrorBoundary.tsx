import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Komunikat awaryjny zamiast pustej strony. */
export function ErrorFallback() {
  return (
    <div
      role="alert"
      className="min-h-[50vh] p-4 md:p-8 flex flex-col items-center justify-center text-center bg-arkusz text-tusz"
    >
      <h1 className="text-2xl font-[800] mb-4">Coś poszło nie tak</h1>
      <p className="text-base mb-8 max-w-md">
        Nie udało się wyświetlić tej strony. Spróbuj wczytać ją ponownie.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-6 py-3 border border-tusz bg-tusz text-arkusz rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
      >
        Wczytaj ponownie
      </button>
    </div>
  );
}

/** Łapie błędy renderowania w drzewie tras i pokazuje ErrorFallback. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('Błąd renderowania strony:', error, info.componentStack);
  }

  render() {
    return this.state.hasError ? <ErrorFallback /> : this.props.children;
  }
}
