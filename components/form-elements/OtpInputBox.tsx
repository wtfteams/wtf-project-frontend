import React from "react"

import { OtpInput } from "react-native-otp-entry"

interface props {
    digits?: number | undefined;
    focusColor?: string | undefined;
    type: "numeric" | "alphanumeric";
    onTextValue: (text: string) => void;
    onFilledValue: (text: string) => void;
}

export default function OtpInputBox({
    digits = 4,
    focusColor = "#3D474E",
    type = "numeric",
    onTextValue,
    onFilledValue,
}: props) {
    return (
        <OtpInput
            numberOfDigits={digits}
            focusColor={focusColor}
            type={type}
            autoFocus={true}
            blurOnFilled={true}
            onTextChange={(text) => onTextValue(text)}
            onFilled={(text) => onFilledValue(text)}
            theme={{
                containerStyle: {
                    display: "flex",
                    gap: 16,
                },
                pinCodeContainerStyle: {
                    width: 70,
                    height: 70,
                    backgroundColor: "#2C2F38",
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: "#3D474E"
                },
                pinCodeTextStyle: {
                    color: "#fff",
                    fontSize: 24,
                    textAlign: 'center',
                    fontWeight: "400",
                    letterSpacing: 5,
                },
                focusStickStyle: {
                    backgroundColor: "#FFCD00", 
                    width: 2, 
                }
            }}
        />
    )
}