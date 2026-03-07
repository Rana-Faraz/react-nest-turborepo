import type { ComponentType, PropsWithChildren, ReactNode } from "react";
import ReactQueryProvider from "./react-query-provider";

interface ProvidersProps {
  children: ReactNode;
}

type ProviderComponent<Props extends object = {}> = ComponentType<
  PropsWithChildren<Props>
>;

type ProviderEntry<Props extends object> = Readonly<{
  Provider: ProviderComponent<Props>;
  props: Props | null;
  isEnabled?: boolean;
}>;

function defineProvider<Props extends object>(
  entry: ProviderEntry<Props>,
): ProviderEntry<Props> {
  return entry;
}

const PROVIDERS = [
  defineProvider({
    Provider: ReactQueryProvider,
    props: null,
    isEnabled: true,
  }),
] as const;

export default function Providers({ children }: Readonly<ProvidersProps>) {
  const enabledProviders = PROVIDERS.filter(({ isEnabled }) => isEnabled);

  const nestedProviders = enabledProviders.reduceRight<ReactNode>(
    (acc, { Provider, props }, index) => (
      <Provider key={Provider.name + index} {...(props ?? {})}>
        {acc}
      </Provider>
    ),
    children,
  );

  return <>{nestedProviders}</>;
}
