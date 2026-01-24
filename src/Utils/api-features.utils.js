export class ApiFeatures {

  // mongooseQuery is mongoose model
  // query is req.query

  constructor(mongooseQuery, query) {
    this.mongooseQuery = mongooseQuery;
    this.query = query;
  }

  pagination() {
    let pageNumber = this.query.page * 1 || 1;
    let limit = 50;
    if (this.query.page <= 0) pageNumber = 1;
    if (!this.query.limit > 50 || !this.query.limit < 1) limit = this.query.limit;
    
    const skip = (pageNumber - 1) * limit;

    this.pageNumber = pageNumber;
    this.mongooseQuery.skip(skip).limit(limit)
    

    return this;

  }

  filter() {
    let filterObj = structuredClone(this.query);
    
    filterObj = JSON.stringify(filterObj);
    filterObj = filterObj.replace(/gt|gte|lt|lte|ne/g, value => `$${value}`);
    filterObj = JSON.parse(filterObj);

    const excludedFields = ['page', 'sort', 'fields', 'search', 'limit'];

    excludedFields.forEach(value => {
      delete filterObj[value]
    })

    this.mongooseQuery.find(filterObj);

    return this;
  }

  sort() {
    if (this.query.sort) {
      const sortedBy = this.query.sort.split(',').join(' ');
      this.mongooseQuery.sort(sortedBy);
    }

    return this;
  }

  fields() {
    if (this.query.fields) {
      const selectedFields = this.query.fields.split(',').join(' ');
      this.mongooseQuery.select(selectedFields);
    }

    return this
  }

  search() {
    if (this.query.search) {
      this.mongooseQuery.find({
        $or: [
          { title: { $regex: this.query.search, $options: 'i' } },
          { description: { $regex: this.query.search, $options: 'i' } },
          { name: { $regex: this.query.search, $options: 'i' } }
        ]
      })
    }

    return this;
  }

  async getCount() {
    const countQuery = this.mongooseQuery.model.countDocuments(this.mongooseQuery.getQuery());
    return countQuery;
  }


}