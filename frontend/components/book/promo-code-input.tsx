"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { usePublicPromoCodesAPI } from "@/hooks/api/use-public-promo-codes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Percent, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { getDefaultBranchId } from "@/lib/branch";

interface PromoCodeInputProps {
    selectedCourt?: any;
    startTime?: string;
    endTime?: string;
}

export function PromoCodeInput({ selectedCourt, startTime, endTime }: PromoCodeInputProps) {
    const form = useFormContext();
    const [promoCode, setPromoCode] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    
    const { validatePromoCode } = usePublicPromoCodesAPI();
    const BRANCH_ID = getDefaultBranchId();

    // Calculate current total based on selected court and time
    const calculateCurrentTotal = () => {
        if (!selectedCourt || !startTime || !endTime) return 0;
        
        // Calculate hours properly
        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(`2000-01-01T${endTime}:00`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        // Get court price from selected court
        const pricePerHour = Number(selectedCourt.price_per_hour) || 0;
        return hours * pricePerHour;
    };

    const currentTotal = calculateCurrentTotal();

    useEffect(() => {
        if (validationResult?.valid) {
            setDiscountAmount(validationResult.discount_amount || 0);
        } else {
            setDiscountAmount(0);
        }
    }, [validationResult]);

    const handleValidatePromoCode = async () => {
        if (!promoCode.trim()) {
            toast.error("Please enter a promo code");
            return;
        }

        if (currentTotal <= 0) {
            toast.error("Please select a court and time first");
            return;
        }

        setIsValidating(true);
        try {
            const result = await validatePromoCode(BRANCH_ID.toString(), {
                code: promoCode.toUpperCase(),
                total_amount: currentTotal,
            });

            if (result.valid) {
                setValidationResult(result);
                form.setValue("promo_code", promoCode.toUpperCase());
                toast.success(`Promo code applied! You saved ${formatCurrency(result.discount_amount || 0)}`);
            } else {
                setValidationResult(null);
                form.setValue("promo_code", "");
                toast.error(result.error || "Invalid promo code");
            }
        } catch (error) {
            setValidationResult(null);
            form.setValue("promo_code", "");
            toast.error("Failed to validate promo code");
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemovePromoCode = () => {
        setPromoCode("");
        setValidationResult(null);
        form.setValue("promo_code", "");
        setDiscountAmount(0);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                <label className="text-sm font-medium">Promo Code (Optional)</label>
            </div>
            
            {!validationResult?.valid ? (
                <div className="flex gap-2">
                    <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="flex-1"
                        disabled={currentTotal <= 0}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleValidatePromoCode}
                        disabled={!promoCode.trim() || isValidating || currentTotal <= 0}
                    >
                        {isValidating ? "Validating..." : "Apply"}
                    </Button>
                </div>
            ) : (
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <div>
                                    <div className="font-medium text-green-900 dark:text-green-100">
                                        {validationResult.promo_code?.code}
                                    </div>
                                    <div className="text-sm text-green-700 dark:text-green-300">
                                        {validationResult.promo_code?.description}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                    -{formatCurrency(discountAmount)}
                                </Badge>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleRemovePromoCode}
                                    className="h-8 w-8 text-green-600 hover:text-green-700 dark:text-green-400"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {discountAmount > 0 && (
                <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between">
                        <span>Original amount:</span>
                        <span>{formatCurrency(currentTotal)}</span>
                    </div>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Discount:</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                        <span>Final amount:</span>
                        <span>{formatCurrency(currentTotal - discountAmount)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
