var _ = require('underscore')

module.exports = function(dynamo) {

  var ammo = {}

  function attributeType(value) {
    var type = typeof value
    if (type === 'string') {
      return 'S'
    }
    if (type === 'boolean') {
      return 'BOOL'
    }
    if (type === 'number') {
      return 'N'
    }
    if (Buffer.isBuffer(value)) {
      return 'B'
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return 'NULL'
      var first = attributeType(value[0])
      var every = value.every(function(elem) {
        return elem === first
      })
      if (every) return first+'S'
      return null
    }
    if (type === 'object') {
      return 'M'
    }
    return null
  }

  function serializeAttribute(value) {
    var type = attributeType(value)
    if (type === 'M') {
      var obj = {}
      Object.keys(value).forEach(function(key) {
        obj[key] = serializeAttribute(value[key])
      })
      return obj
    } else if (Array.isArray(value)) {
      return value.map(function(elem) {
        return serializeAttribute(elem)
      })
    } else {
      var obj = {}
      obj[type] = value
      return obj
    }
  }

  ammo.PutItem = function(table) {
    var self = this
    var params = { TableName: table, ExpressionAttributeValues: {} }

    self.item = function(item) {
      params.Item = serializeAttribute(item)
      return self
    }

    // 'INDEXES | TOTAL | NONE'
    self.returnConsumedCapacity = function(val) {
      params.ReturnConsumedCapacity = val.toUpperCase()
      return self
    }

    // 'SIZE | NONE'
    self.returnItemCollectionMetrics = function(val) {
      params.ReturnItemCollectionMetrics = val.toUpperCase()
      return self
    }

    // 'NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW'
    self.returnValues = function(val) {
      params.ReturnValues = val.toUpperCase()
      return self
    }

    self.condition = function(condition, values) {
      params.ConditionExpression = condition
      params.ExpressionAttributeValues = _.extend(params.ExpressionAttributeValues, serializeAttribute(values))
      return self
    }

    self.run = function(callback) {
      dynamo.putItem(self.params(), callback)
      return self
    }

    self.params = function() {
      return params
    }

    return self
  }

  ammo.UpdateItem = function(table) {
    var self = this
    var params = { TableName: table, ExpressionAttributeValues: {} }

    self.key = function(key) {
      params.Key = serializeAttribute(key)
      return self
    }

    self.update = function(expression, values) {
      params.UpdateExpression = expression
      params.ExpressionAttributeValues = _.extend(params.ExpressionAttributeValues, serializeAttribute(values))
      return self
    }

    self.condition = function(condition, values) {
      params.ConditionExpression = condition
      params.ExpressionAttributeValues = _.extend(params.ExpressionAttributeValues, serializeAttribute(values))
      return self
    }

    // 'INDEXES | TOTAL | NONE'
    self.returnConsumedCapacity = function(val) {
      params.ReturnConsumedCapacity = val.toUpperCase()
      return self
    }

    // 'SIZE | NONE'
    self.returnItemCollectionMetrics = function(val) {
      params.ReturnItemCollectionMetrics = val.toUpperCase()
      return self
    }

    // 'NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW'
    self.returnValues = function(val) {
      params.ReturnValues = val.toUpperCase()
      return self
    }

    self.run = function(callback) {
      dynamo.updateItem(self.params(), callback)
      return self
    }

    self.params = function() {
      return params
    }

    return self
  }

  ammo.DeleteItem = function(table) {
    var self = this
    var params = { TableName: table, ExpressionAttributeValues: {} }

    self.key = function(key) {
      params.Key = serializeAttribute(key)
      return self
    }

    // 'INDEXES | TOTAL | NONE'
    self.returnConsumedCapacity = function(val) {
      params.ReturnConsumedCapacity = val.toUpperCase()
      return self
    }

    // 'SIZE | NONE'
    self.returnItemCollectionMetrics = function(val) {
      params.ReturnItemCollectionMetrics = val.toUpperCase()
      return self
    }

    // 'NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW'
    self.returnValues = function(val) {
      params.ReturnValues = val.toUpperCase()
      return self
    }

    self.condition = function(condition, values) {
      params.ConditionExpression = condition
      params.ExpressionAttributeValues = _.extend(params.ExpressionAttributeValues, serializeAttribute(values))
      return self
    }

    self.run = function(callback) {
      dynamo.deleteItem(self.params(), callback)
      return self
    }

    self.params = function() {
      return params
    }

    return self
  }

  ammo.GetItem = function(table) {
    var self = this
    var params = { TableName: table }

    self.key = function(key) {
      params.Key = serializeAttribute(key)
      return self
    }

    // 'INDEXES | TOTAL | NONE'
    self.returnConsumedCapacity = function(val) {
      params.ReturnConsumedCapacity = val.toUpperCase()
      return self
    }

    self.consistentRead = function(bool) {
      params.ConsistentRead = bool
      return self
    }

    self.run = function(callback) {
      dynamo.getItem(self.params(), callback)
      return self
    }

    self.projection = function(expression) {
      params.ProjectionExpression = expression
      return self
    }

    self.params = function() {
      return params
    }

    return self
  }

  ammo.Query = function(table) {
    var self = this
    var params = { TableName: table, ExpressionAttributeValues: {} }

    // 'ALL_ATTRIBUTES | ALL_PROJECTED_ATTRIBUTES | SPECIFIC_ATTRIBUTES | COUNT'
    self.select = function(select) {
      select = select === '*' ? 'ALL_ATTRIBUTES' : select
      params.Select = select.toUpperCase()
      return self
    }

    self.consistentRead = function(bool) {
      params.ConsistentRead = bool
      return self
    }

    self.indexName = function(indexName) {
      params.IndexName = indexName
      return self
    }

    self.exclusiveStartKey = function(key) {
      params.ExclusiveStartKey = serializeAttribute(key)
      return self
    }

    self.condition = function(expression, values) {
      params.KeyConditionExpression = expression
      params.ExpressionAttributeValues = _.extend(params.ExpressionAttributeValues, serializeAttribute(values))
      return self
    }

    self.filter = function(expression, values) {
      params.FilterExpression = expression
      params.ExpressionAttributeValues = _.extend(params.ExpressionAttributeValues, serializeAttribute(values))
      return self
    }

    self.projection = function(expression) {
      params.ProjectionExpression = expression
      return self
    }

    // 'INDEXES | TOTAL | NONE'
    self.returnConsumedCapacity = function(val) {
      params.ReturnConsumedCapacity = val.toUpperCase()
      return self
    }

    self.limit = function(limit) {
      params.Limit = limit
      return self
    }

    self.forward = function(bool) {
      params.ScanIndexForward = bool
      return self
    }

    self.params = function() {
      return params
    }

    self.query = function(callback) {
      dynamodb.query(self.params(), callback)
      return self
    }

    return self
  }

  ammo.Scan = function(table) {
    var self = this
    var params = { TableName: table, ExpressionAttributeValues: {} }

    // 'ALL_ATTRIBUTES | ALL_PROJECTED_ATTRIBUTES | SPECIFIC_ATTRIBUTES | COUNT'
    self.select = function(select) {
      select = select === '*' ? 'ALL_ATTRIBUTES' : select
      params.Select = select.toUpperCase()
      return self
    }

    self.consistentRead = function(bool) {
      params.ConsistentRead = bool
      return self
    }

    self.indexName = function(indexName) {
      params.IndexName = indexName
      return self
    }

    self.exclusiveStartKey = function(key) {
      params.ExclusiveStartKey = serializeAttribute(key)
      return self
    }

    self.filter = function(expression, values) {
      params.FilterExpression = expression
      params.ExpressionAttributeValues = _.extend(params.ExpressionAttributeValues, serializeAttribute(values))
      return self
    }

    self.projection = function(expression) {
      params.ProjectionExpression = expression
      return self
    }

    // 'INDEXES | TOTAL | NONE'
    self.returnConsumedCapacity = function(val) {
      params.ReturnConsumedCapacity = val.toUpperCase()
      return self
    }

    self.limit = function(limit) {
      params.Limit = limit
      return self
    }

    self.segment = function(segment) {
      params.Segment = segment
      return self
    }

    self.totalSegments = function(totalSegments) {
      params.TotalSegments = totalSegments
      return self
    }

    self.params = function() {
      return params
    }

    self.scan = function(callback) {
      dynamodb.scan(self.params(), callback)
      return self
    }

    return self
  }

  return ammo

}
