import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangleIcon } from "lucide-react";

export function AlertColors({ errorMsg }) {
	return (
		<div className="fixed -top-3/12 mt-2 left-1/2 -translate-x-1/2 z-50">
			<Alert className="w-fit max-w-sm border-red-950 bg-red-700 text-white pl-8 pr-12 shadow-lg">
				<AlertTriangleIcon size={20} />
				<AlertTitle className="text-gray-200">
					{errorMsg?.status
						? `Error Code ${errorMsg.status}`
						: "Failed to connect."}
				</AlertTitle>
				<AlertDescription>
					{errorMsg?.message}
				</AlertDescription>
			</Alert>
		</div>
	);
}