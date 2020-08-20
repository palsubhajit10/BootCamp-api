const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  const reqQuery = { ...req.query };
  const excludeFields = ["select", "sort", "page", "limit"];
  excludeFields.forEach((el) => delete reqQuery[el]);

  //Filtering
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(lte|lt|gt|gte|in)\b/g,
    (match) => `$${match}`
  );
  query = model.find(JSON.parse(queryStr));

  //select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }
  //sorting
  if (req.query.sort) {
    const sortby = req.query.sort.split(",").join(" ");
    query = query.sort(sortby);
  } else {
    query = query.sort("-createdAt");
  }
  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();
  query = query.skip(startIndex).limit(limit);
  if (populate) {
    query = query.populate(populate);
  }
  const results = await query;

  //Pagination Resuls
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
