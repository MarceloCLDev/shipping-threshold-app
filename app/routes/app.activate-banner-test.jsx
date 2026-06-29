import { authenticate } from "../shopify.server";

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const enabled = formData.get("enabled") === "true";

  const config = {
    enabled,
    showForVariant: "A",
  };

  const shopResponse = await admin.graphql(`
    #graphql
    query {
      shop {
        id
      }
    }
  `);

  const shopData = await shopResponse.json();
  const shopId = shopData.data.shop.id;

  const response = await admin.graphql(
    `#graphql
    mutation SaveBannerTestConfig($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            ownerId: shopId,
            namespace: "$app",
            key: "banner_config",
            type: "json",
            value: JSON.stringify(config),
          },
        ],
      },
    },
  );

  const data = await response.json();
  const errors = data.data.metafieldsSet.userErrors;

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    message: enabled ? "Banner test activated" : "Banner test disabled",
    config,
  };
}