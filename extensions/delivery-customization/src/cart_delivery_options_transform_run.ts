import type {
  RunInput,
  CartDeliveryOptionsTransformRunResult,
} from "../generated/api";

const NO_CHANGES: CartDeliveryOptionsTransformRunResult = {
  operations: [],
};

const RATE_A_TITLE = "Standard U.S.";
const RATE_B_TITLE = "Free Standard U.S. Shipping";

export function cartDeliveryOptionsTransformRun(
  input: RunInput
): CartDeliveryOptionsTransformRunResult {
  const variant = input.cart.attribute?.value;

  const isVariantB = variant === "B";
  const titleToHide = isVariantB ? RATE_A_TITLE : RATE_B_TITLE;

  const operations: CartDeliveryOptionsTransformRunResult["operations"] = [];

  for (const group of input.cart.deliveryGroups ?? []) {
    for (const option of group.deliveryOptions ?? []) {
      if (option.title === titleToHide) {
        operations.push({
          deliveryOptionHide: {
            deliveryOptionHandle: option.handle,
          },
        });
      }
    }
  }

  return { operations };
}