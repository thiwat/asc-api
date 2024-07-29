import * as _ from "lodash";
import * as mongoose from "mongoose";

import { Injectable } from "@nestjs/common";
import { SearchResultDto } from "../dto/search_result.dto";
import { SearchQueryDto } from "../dto/search_query.dto";
import { ListQueryDto } from "../dto/list_query.dto";
import { Logger } from "winston";
import logger from 'src/common/utils/logger'
import { ImageDto } from "../dto/image.dto";
import * as probe from 'probe-image-size'

@Injectable()
export class BaseService<T extends mongoose.Document> {

  protected _searchFields: Array<string> = [];
  protected default_populate_fields: Array<any> = [];
  protected logger: Logger
  protected _docRefField: string;
  public searchFields: Array<string> = [];


  constructor(
    protected model: mongoose.Model<T>,
  ) {
    this.logger = logger.child({
      service: this.constructor.name
    })
    this._initialFields();
  }

  private _initialFields() {
    this._searchFields = _.reduce(this.model.schema.paths,
      (r, i, k) => {
        if (i.instance === 'String') {
          r.push(k);
        }
        return r;
      }
      , []);
  }

  private _mergeSearchFields(fields: Array<string>): Array<string> {
    return _.uniq(
      [...fields, ...(this._searchFields || []), ...this.searchFields]
    );
  }

  private _buildFilter(keyword: string, filter: any, searchFields?: any): any {
    let result = {};
    if (!_.isEmpty(keyword)) {
      result["$or"] = [];
      for (const field of searchFields) {
        const q = {};
        q[field] = { $regex: keyword, $options: "i" };
        result["$or"].push(q);
      }
    }
    if (_.isEmpty(result["$or"])) {
      delete result["$or"];
    }
    result = _.merge(result, filter);
    return result;
  }

  private _buildSort(sort: string): any {
    const result = {};
    if (_.isEmpty(sort)) {
      return result;
    }
    for (const term of sort.split(",")) {
      if (term.startsWith("-")) {
        result[term.slice(1)] = -1;
      } else {
        result[term] = 1;
      }
    }
    return result;
  }

  private _formatResult(data: any): any {
    data = JSON.parse(JSON.stringify(data));
    if (_.isEmpty(data)) {
      return _.isArray(data) ? [] : {};
    }
    return data;
  }

  protected async _prepareImageData(data: ImageDto, oldData: ImageDto): Promise<ImageDto> {
    if (!data?.url) {
      return {}
    }

    if (data?.url !== oldData?.url) {
      const result = await probe(data.url)
      return {
        url: data.url,
        width: result.width,
        height: result.height
      }
    }

    return oldData
  }

  public async search(
    query: SearchQueryDto,
    searchFields: any = [],
    populateFields: any = []
  ): Promise<SearchResultDto> {
    searchFields = this._mergeSearchFields(searchFields);

    let result = {} as SearchResultDto;

    const filter = this._buildFilter(
      query.keywords,
      query.filter,
      searchFields
    );
    query.page_size = query.page_size || 10
    const currentPage = (query.page - 1) * query.page_size;

    result.page = query.page;
    result.page_size = query.page_size;

    result.total = await this.model.count(filter);
    result.total_page = Math.ceil(result.total / query.page_size);
    result.rows = _.isEmpty(populateFields)
      ? await this.model
        .find(filter)
        .select(query.fields)
        .populate(this.default_populate_fields)
        .sort(this._buildSort(query.sort))
        .skip(currentPage)
        .limit(query.page_size)
      : await this.model
        .find(filter)
        .select(query.fields)
        .populate(populateFields)
        .sort(this._buildSort(query.sort))
        .skip(currentPage)
        .limit(query.page_size)
        .exec();

    result = this._formatResult(result);
    return result;
  }

  public async list(
    query: ListQueryDto,
    searchFields: any = [],
    populateFields: any = []
  ): Promise<T[]> {
    searchFields = this._mergeSearchFields(searchFields);
    const filter = this._buildFilter(
      query.keywoard,
      query.filter,
      searchFields
    );

    let result = _.isEmpty(populateFields)
      ? await this.model
        .find(filter)
        .populate(this.default_populate_fields)
        .sort(this._buildSort(query.sort))
      : await this.model
        .find(filter)
        .populate(populateFields)
        .sort(this._buildSort(query.sort))
        .exec();

    result = this._formatResult(result);
    return result;
  }

  public async get(
    id: string,
    populateFields: any = []
  ): Promise<T> {
    let result = _.isEmpty(populateFields)
      ? await this.model.findById(id)
        .populate(this.default_populate_fields)
        .exec()
      : await this.model.findById(id)
        .populate(populateFields)
        .exec();
    result = this._formatResult(result);
    return result as T;
  }

  public async count(
    query: ListQueryDto,
  ): Promise<number> {
    const filter = this._buildFilter(
      query.keywoard,
      query.filter,
    );

    return this.model.count(filter)
  }

  public async find(
    query: { [K in keyof T]?: any },
    populateFields: any = [],
    sort?: string
  ): Promise<T> {
    const filter = this._buildFilter("", query, []);
    let result = _.isEmpty(populateFields)
      ? await this.model.findOne(filter)
        .populate(this.default_populate_fields)
        .sort(this._buildSort(sort))
        .exec()
      : await this.model.findOne(filter)
        .populate(populateFields)
        .sort(this._buildSort(sort))
        .exec();
    result = this._formatResult(result);
    return result as T;
  }

  public async create(data: any): Promise<any> {
    const dataModel = new this.model(data);
    const result = await dataModel.save();
    const resultObj = result.toJSON()

    return resultObj
  }

  public async update(id: string, data: any): Promise<any> {
    const current = await this.model.findById(id)
    const currentObj = current.toJSON()

    const result = await this.model.findByIdAndUpdate(id, data as any, {
      new: true,
    }).populate(this.default_populate_fields);
    const resultObj = result.toJSON()


    return resultObj
  }

  public async delete(id: string): Promise<any> {
    const current = await this.model.findById(id)
    const currentObj = current.toJSON()

    await this.model
      .deleteOne({ _id: id } as mongoose.FilterQuery<T>);

    return currentObj;
  }

  public async aggregate(pipeline: Array<any>): Promise<any> {
    return await this.model.aggregate(pipeline);
  }

  public async deleteMany(filter?: any): Promise<any> {
    return await this.model.deleteMany(filter)
  }

  public async updateMany(filter?: any, update?: any, options?: any) {
    return await this.model.updateMany(filter, update, options)
  }

  public async insertMany(doc?: any, options?: any) {
    return await this.model.insertMany(doc, options)
  }
}
