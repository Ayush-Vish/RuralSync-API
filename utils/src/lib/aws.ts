import {
      config,
      S3
} from "aws-sdk";
config.update({
      region: "us-west-2",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY

})

const s3 = new S3();
export{
      s3
}