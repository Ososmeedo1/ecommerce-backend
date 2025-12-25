import mongoose from 'mongoose'
import mongoosePaginattion from 'mongoose-paginate-v2'

mongoose.plugin(mongoosePaginattion);

export default mongoose;