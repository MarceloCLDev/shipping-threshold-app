import { authenticate } from "../shopify.server";

const TITLE = "Hide Express Shipping";
const FUNCTION_HANDLE = "delivery-customization";

const GET_DELIVERY_CUSTOMIZATIONS = `#graphql
  query GetDeliveryCustomizations {
    deliveryCustomizations(first: 25) {
      nodes {
        id
        title
        enabled
      }
    }
  }
`;

const CREATE_DELIVERY_CUSTOMIZATION = `#graphql
  mutation CreateDeliveryCustomization($deliveryCustomization: DeliveryCustomizationInput!) {
    deliveryCustomizationCreate(deliveryCustomization: $deliveryCustomization) {
      deliveryCustomization {
        id
        title
        enabled
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  // 1. Check existing delivery customizations
  const existingResponse = await admin.graphql(GET_DELIVERY_CUSTOMIZATIONS);
  const existingJson = await existingResponse.json();

  const existing = existingJson.data.deliveryCustomizations.nodes.find(
    (customization) => customization.title === TITLE
  );

  // 2. If already exists, return it
  if (existing) {
    return Response.json({
      created: false,
      message: "Delivery customization already exists.",
      deliveryCustomization: existing,
    });
  }

  // 3. Otherwise create it
  const createResponse = await admin.graphql(CREATE_DELIVERY_CUSTOMIZATION, {
    variables: {
      deliveryCustomization: {
        title: TITLE,
        enabled: true,
        functionHandle: FUNCTION_HANDLE,
      },
    },
  });

  const createJson = await createResponse.json();

  const userErrors =
    createJson.data.deliveryCustomizationCreate.userErrors || [];

  if (userErrors.length > 0) {
    return Response.json(
      {
        created: false,
        errors: userErrors,
      },
      { status: 400 }
    );
  }

  return Response.json({
    created: true,
    message: "Delivery customization created.",
    deliveryCustomization:
      createJson.data.deliveryCustomizationCreate.deliveryCustomization,
  });
}