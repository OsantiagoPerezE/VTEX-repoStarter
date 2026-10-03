interface StorefrontFunctionComponent<
  P = Record<string, unknown>,
> extends React.FunctionComponent<P> {
  schema?: Record<string, unknown>;
}

declare module "*.graphql" {
  import type { DocumentNode } from "graphql";

  const value: DocumentNode;
  export default value;
}

declare module "vtex.product-context" {
  export function useProduct():
    | { product?: { productId?: string } | null }
    | undefined;
}

declare module "vtex.order-manager/OrderForm" {
  export function useOrderForm(): {
    loading: boolean;
    orderForm?: {
      shippingData?: { address?: { postalCode?: string | null } | null } | null;
    } | null;
  };
}

declare module "vtex.css-handles" {
  export function useCssHandles<T extends string>(
    handles: readonly T[],
  ): { handles: Record<T, string> };
}
