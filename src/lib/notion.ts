import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  QueryDataSourceResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { env } from "@/lib/env";
import type { NotionContact } from "@/types/contact";

function getClient() {
  return new Client({ auth: env.notionApiKey });
}

function plainText(prop: PageObjectResponse["properties"][string]): string | null {
  if (prop.type === "title") {
    return prop.title.map((t) => t.plain_text).join("") || null;
  }
  if (prop.type === "select") {
    return prop.select?.name ?? null;
  }
  if (prop.type === "email") {
    return prop.email;
  }
  if (prop.type === "url") {
    return prop.url;
  }
  if (prop.type === "date") {
    return prop.date?.start ?? null;
  }
  if (prop.type === "phone_number") {
    return prop.phone_number;
  }
  return null;
}

function pageToContact(page: PageObjectResponse): NotionContact {
  const props = page.properties;
  return {
    notionPageId: page.id,
    name: plainText(props["Name"]) ?? "(sans nom)",
    company: plainText(props["Company"]),
    type: plainText(props["Type"]),
    email: plainText(props["Email"]),
    linkedin: plainText(props["LinkedIn"]),
    phone: plainText(props["Phone"]),
    lastReach: plainText(props["Last Reach"]),
  };
}

export async function fetchContacts(): Promise<NotionContact[]> {
  const notion = getClient();
  const contacts: NotionContact[] = [];
  let cursor: string | undefined;

  do {
    const response: QueryDataSourceResponse = await notion.dataSources.query({
      data_source_id: env.notionDataSourceId,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const page of response.results) {
      if ("properties" in page) {
        contacts.push(pageToContact(page as PageObjectResponse));
      }
    }
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return contacts;
}

export async function updateLastReach(pageId: string, isoDate: string): Promise<void> {
  const notion = getClient();
  await notion.pages.update({
    page_id: pageId,
    properties: {
      "Last Reach": {
        date: { start: isoDate },
      },
    },
  });
}

export async function updateType(pageId: string, type: string): Promise<void> {
  const notion = getClient();
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Type: {
        select: { name: type },
      },
    },
  });
}

export async function updateEmail(pageId: string, email: string | null): Promise<void> {
  const notion = getClient();
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Email: { email },
    },
  });
}

export async function updateLinkedin(pageId: string, url: string | null): Promise<void> {
  const notion = getClient();
  await notion.pages.update({
    page_id: pageId,
    properties: {
      LinkedIn: { url },
    },
  });
}

export async function archiveContact(pageId: string): Promise<void> {
  const notion = getClient();
  await notion.pages.update({
    page_id: pageId,
    archived: true,
  });
}

export async function updatePhone(pageId: string, phoneNumber: string | null): Promise<void> {
  const notion = getClient();
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Phone: { phone_number: phoneNumber },
    },
  });
}
