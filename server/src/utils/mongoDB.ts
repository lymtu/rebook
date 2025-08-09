import {
  MongoClient,
  type Filter,
  type Document,
  // type FindOptions,
} from "mongodb";

import ENV from "@/ENV.dev";

const url = ENV.DB.url;

const client = new MongoClient(url, ENV.DB.options);
const dbName = ENV.DB.dbName;

const getCollection = async (collectionName: string) => {
  const connection = await client.connect();
  const db = connection.db(dbName);
  return db.collection(collectionName);
};

export const find = async (
  collectionName: string,
  {
    filter = {},
    sort = {},
    project = {},
  }: {
    filter?: Filter<Document>;
    sort?: {
      [key in string]: 1 | -1;
    };
    project?: { [key in string]: number };
  }
): Promise<any[]> => {
  try {
    const collection = await getCollection(collectionName);
    return await collection.find(filter).project(project).sort(sort).toArray();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 *
 * @param {string} collectionName 链接的集合名称
 * @param option.filter 过滤条件
 * @param option.sort 排序条件 1升序 -1 降序
 * @param option.project 投影条件
 * @param page 页码 默认1
 * @param pageSize 每页条数
 * @param isFindAll 是否查询所有数据，默认true
 * @returns Promise<{ data: Documnet[]; totalDocuments: number; totalPages: number; currentPage: number; pageSize: number; }>
 */
export const findWithPagination = async (
  collectionName: string,
  {
    filter = {},
    sort = {},
    project = {},
    page = 1,
    pageSize = 10,
  }: {
    filter?: Filter<Document>;
    sort?: {
      [key in string]: 1 | -1;
    };
    project?: Document;
    page?: number;
    pageSize?: number;
  },
  isFindAll: boolean = false
) => {
  try {
    const collection = await getCollection(collectionName);

    const totalDocuments = await getCount(
      collectionName,
      isFindAll ? {} : filter
    );
    const totalPages = Math.ceil(totalDocuments / pageSize);
    const result = await collection
      .find(filter)
      .project(project)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize ?? totalDocuments)
      .toArray();

    return {
      data: result,
      totalDocuments,
      totalPages,
      currentPage: page,
      pageSize,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const insert = async (collectName: string, newData: any & any[]) => {
  try {
    const collection = await getCollection(collectName);
    if (Array.isArray(newData)) {
      return await collection.insertMany(newData);
    }

    return await collection.insertOne(newData);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateOne = async (
  collectionName: string,
  filter: Filter<Document>,
  update: Document
) => {
  try {
    const collection = await getCollection(collectionName);
    return await collection.updateOne(filter, update);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateMany = async (
  collectionName: string,
  filter: Filter<Document>,
  update: Document
) => {
  try {
    const collection = await getCollection(collectionName);
    return await collection.updateMany(filter, update);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteData = async (
  collectionName: string,
  filter: Filter<Document>
) => {
  try {
    const collection = await getCollection(collectionName);
    return await collection.deleteMany(filter);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getCount = async (
  collectionName: string,
  filter: Filter<Document> = {}
) => {
  try {
    const collection = await getCollection(collectionName);
    if (Object.keys(filter).length === 0) {
      return await collection.countDocuments(filter, { hint: "_id_" });
    }

    return await collection.countDocuments(filter);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
