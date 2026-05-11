import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../share/catchAsync";
import { sendResponse } from "../../share/sendResponse";
import { TemplateService } from "./templates.service";

/**
 * CREATE TEMPLATE (Admin Only)
 */
const createTemplate = catchAsync(async (req: Request, res: Response) => {
    const result = await TemplateService.createTemplateIntoDB(req.body);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Template created successfully",
        data: result,
    });
});

/**
 * GET ALL TEMPLATES
 */
const getAllTemplates = catchAsync(async (req: Request, res: Response) => {
    const result = await TemplateService.getAllTemplatesFromDB(req.query as any);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Templates retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

/**
 * GET SINGLE TEMPLATE
 */
const getTemplateById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TemplateService.getTemplateByIdFromDB(id as string);

    if (!result) {
        return sendResponse(res, {
            httpStatusCode: status.NOT_FOUND,
            success: false,
            message: "Template not found",
            data: null,
        });
    }

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Template retrieved successfully",
        data: result,
    });
});

/**
 * UPDATE TEMPLATE (Admin Only)
 */
const updateTemplate = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TemplateService.updateTemplateIntoDB(id as string, req.body);

    if (!result) {
        return sendResponse(res, {
            httpStatusCode: status.NOT_FOUND,
            success: false,
            message: "Template not found",
            data: null,
        });
    }

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Template updated successfully",
        data: result,
    });
});

/**
 * DELETE TEMPLATE (Admin Only)
 */
const deleteTemplate = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TemplateService.deleteTemplateFromDB(id as string);

    if (!result) {
        return sendResponse(res, {
            httpStatusCode: status.NOT_FOUND,
            success: false,
            message: "Template not found",
            data: null,
        });
    }

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Template deleted successfully",
        data: result,
    });
});

export const TemplateController = {
    createTemplate,
    getAllTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
};
