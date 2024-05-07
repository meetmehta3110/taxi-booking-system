import  {STATUS_CODE , code ,STATUS }  from "../../src/constants/constant";
import { Request, Response } from 'express';



interface Field {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object'; // Adjust as needed for other types
}

interface ValidationResult {
    valid: boolean;
    errorResponse?: {
        status: number;
        code: number;
        success: number;
    };
}


export const postRequest = (req:Request, res:Response, fields: Field[]): ValidationResult => {
    for (const field of fields) {
        const { name, type } = field;
        if (typeof req.body[name] !== type) {
            return {
                valid: false,
                errorResponse: {
                    status: STATUS_CODE.ERROR,
                    code: code.Invalid_or_missing_parameter,
                    success : STATUS.False
                },
            };
        }
    }
    
    return { valid: true };
}

export const getRequest = (req: Request, res: Response, fields: Field[]): ValidationResult => {
    for (const field of fields) {
        const { name } = field;
        if ( !req.query[name] ) { // Assuming you're validating query parameters
            return {
                valid: false,
                errorResponse: {
                    status: STATUS_CODE.ERROR,
                    code: code.Invalid_or_missing_parameter,
                    success: STATUS.False
                },
            };
        }
    }
    
    return { valid: true };
}
