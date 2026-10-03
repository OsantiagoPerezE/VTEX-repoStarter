import React, { useMemo } from "react";
import { useQuery } from "react-apollo";
import { useProduct } from "vtex.product-context";
import { useOrderForm } from "vtex.order-manager/OrderForm";
import { useCssHandles } from "vtex.css-handles";

import ESTIMATE_SHIPPING from "../../graphql/estimateShipping.graphql";

const CSS_HANDLES = [
  "container",
  "title",
  "estimate",
  "carrier",
  "price",
  "error",
] as const;

// Último recurso cuando el comprador aún no tiene dirección en el orderForm.
const FALLBACK_POSTAL_CODE = "110111";

interface Props {
  showCarrierName?: boolean;
  blockClass?: string;
}

interface ShippingEstimate {
  carrierName: string;
  estimatedDays: number;
  price: number;
}

interface QueryData {
  estimateShipping: ShippingEstimate[] | null;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

const ShippingEstimateBadge: StorefrontFunctionComponent<Props> = ({
  showCarrierName = false,
}) => {
  const { handles } = useCssHandles(CSS_HANDLES);
  const productContext = useProduct();
  const { orderForm } = useOrderForm();

  // Se derivan valores primitivos: el componente solo reconsulta cuando
  // cambian realmente el producto o el código postal, no con cualquier
  // cambio del product-context.
  const productId = productContext?.product?.productId;
  const postalCode =
    orderForm?.shippingData?.address?.postalCode || FALLBACK_POSTAL_CODE;

  const { data, loading, error } = useQuery<QueryData>(ESTIMATE_SHIPPING, {
    variables: { productId, postalCode },
    skip: !productId,
  });

  // `reduce` obtiene la opción más rápida sin ordenar ni mutar `data` (el
  // resultado cacheado de Apollo). useMemo evita recalcular en cada render.
  const fastest = useMemo(() => {
    const estimates = data?.estimateShipping;

    if (!estimates || estimates.length === 0) return undefined;

    return estimates.reduce((a, b) =>
      b.estimatedDays < a.estimatedDays ? b : a,
    );
  }, [data]);

  if (!productId || loading) return null;

  if (error) {
    return (
      <div className={handles.error}>
        No pudimos calcular el estimado de entrega
      </div>
    );
  }

  // Lista vacía (el servicio no cotizó o hubo fallback): no se muestra el badge.
  if (!fastest) return null;

  return (
    <div className={handles.container}>
      <span className={handles.title}>Recíbelo en</span>{" "}
      <strong className={handles.estimate}>
        {fastest.estimatedDays} días hábiles
      </strong>
      {showCarrierName && (
        <span className={handles.carrier}> con {fastest.carrierName}</span>
      )}{" "}
      <span className={handles.price}>({formatPrice(fastest.price)})</span>
    </div>
  );
};

ShippingEstimateBadge.schema = {
  title: "Shipping Estimate Badge",
};

export default React.memo(ShippingEstimateBadge);
