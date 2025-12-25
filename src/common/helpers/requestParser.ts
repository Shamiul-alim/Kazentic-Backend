// @/common/helpers/requestParser.ts

import { Injectable } from "@nestjs/common";

/**
 * Function to create query options for fetching a single record.
 * @param query - The query object passed in the request.
 * @returns The formatted query object for the 'findOne' method.
 */
export function makeFindOneOption(query: any) {
  const findOptions: any = {};

  // Here you can map fields from query to find options for a 'findOne' operation
  if (query?.id) {
    findOptions.where = { id: query.id };  // For example, finding by id
  }

  // Add more conditions as necessary based on your application's schema
  return findOptions;
}

/**
 * Function to create query options for fetching multiple records.
 * @param query - The query object passed in the request.
 * @param searchFields - The fields to search for, typically columns in the database.
 * @returns The formatted query object for the 'find' method.
 */
export function makeFindOption(query: any, searchFields: string[]) {
  const findOptions: any = {};
  
  // Build a dynamic filter from the query fields
  if (searchFields && searchFields.length > 0) {
    findOptions.where = {};
    searchFields.forEach((field) => {
      if (query[field]) {
        findOptions.where[field] = query[field];
      }
    });
  }

  // Optional: You can add sorting, pagination, or other features as needed
  if (query?.sort) {
    findOptions.order = query.sort; // Example: { createdAt: 'ASC' }
  }

  if (query?.page && query?.limit) {
    findOptions.skip = (query.page - 1) * query.limit;
    findOptions.take = query.limit;
  }

  return findOptions;
}
