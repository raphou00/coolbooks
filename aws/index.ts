import filesBucket from "./s3";
import bookCreatorFunction from "./lambda";
import rateLimitTable from "./dynamodb";

const { files, cloudfront } = filesBucket();
const bookCreator = bookCreatorFunction(files.bucket);
const rateLimits = rateLimitTable();

export const bookCreatorArn = bookCreator.invokeArn;
export const bucketName = files.bucket;
export const cloudfrontUrl = cloudfront.domainName;
export const rateLimitsName = rateLimits.name;
