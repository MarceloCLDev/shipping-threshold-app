import type {
  RunInput,
  CartDeliveryOptionsTransformRunResult,
} from "../generated/api";

const NO_CHANGES: CartDeliveryOptionsTransformRunResult = {
  operations: [],
};

type SplitTestConfig = {
  enabled: boolean;
  optionA: string;
  optionB: string;
};

function getSplitTestConfig(input: RunInput): SplitTestConfig | null {
  const value = input.shop?.metafield?.value;

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as SplitTestConfig;
  } catch {
    return null;
  }
}

export function cartDeliveryOptionsTransformRun(
  input: RunInput
): CartDeliveryOptionsTransformRunResult {
  const config = getSplitTestConfig(input);

  if (!config?.enabled) {
    return NO_CHANGES;
  }

  const variant = input.cart.attribute?.value;

  const isVariantB = variant === "B";
  const titleToHide = isVariantB ? config.optionA : config.optionB;

  const operations: CartDeliveryOptionsTransformRunResult["operations"] = [];

  for (const group of input.cart.deliveryGroups ?? []) {
    for (const option of group.deliveryOptions ?? []) {
      const optionAmount = Number(option.cost.amount);

      if (option.title === titleToHide && optionAmount === 0) {
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