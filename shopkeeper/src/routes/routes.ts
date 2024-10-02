import express from 'express';
import { addNewService, assignAgent, getOrgDetails, getServiceProviderById, registerOrg } from '../controllers/controller';
import { isAuthorized, verifyJWT } from '@org/utils';

const router = express.Router();

router.get("/",(req , res ) => {
      return res.status(200).json({
            message: "Welcome to Shopkeeper API"
      })
} )

// router.route("/:id")
//       .get(getServiceProviderById);

router.get("/org-detail", verifyJWT, isAuthorized(["SERVICE_PROVIDER"]), getOrgDetails);
router.post('/registerOrg' , verifyJWT ,isAuthorized(
      ["SERVICE_PROVIDER"]
) ,registerOrg); 

router.post("/add-new-service" , verifyJWT, isAuthorized(["SERVICE_PROVIDER"]) , addNewService);

router.post("/assign-agent" , verifyJWT, isAuthorized(["SERVICE_PROVIDER"]) , assignAgent);


/**
 * TODO: Add a route to verify a Organization using legal documents
*/

export default router;