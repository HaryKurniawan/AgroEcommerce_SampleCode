"use client";

import { Modal, Button } from "antd";
import { ReactNode } from "react";
import Image from "next/image";

export interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: ReactNode;
  illustration?: string;
  title: string;
  description: string;
  primaryButton: {
    label: string;
    onClick: () => void;
    danger?: boolean;
    className?: string;
    disabled?: boolean;
  };
  secondaryButton?: {
    label: string;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
  };
  variant?: "vertical" | "horizontal";
}

const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  icon,
  illustration,
  title,
  description,
  primaryButton,
  secondaryButton,
  variant = "vertical",
}) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={340}
      className="action-modal"
      closeIcon={false}
      style={{
        borderRadius: "2rem",
        overflow: "hidden",
      }}
      styles={{
        body: {
          padding: "16px 8px 8px",
        },
      }}
    >
      <div className="flex flex-col items-center justify-center text-center">
        {illustration ? (
          <div className="relative w-full h-44 mb-6">
            <Image
              src={illustration}
              alt="Illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        ) : (
          icon && (
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
              {icon}
            </div>
          )
        )}

        <h3 className="font-display font-semibold text-lg text-gray-900 mb-1 leading-tight">
          {title}
        </h3>

        <p className="text-gray-500 mb-8 text-[13px] px-2 leading-relaxed font-normal">
          {description}
        </p>

        <div
          className={`flex ${variant === "horizontal" ? "flex-row-reverse" : "flex-col"} gap-2 w-full`}
        >
          <Button
            type="primary"
            danger={primaryButton.danger}
            size="large"
            onClick={primaryButton.onClick}
            disabled={primaryButton.disabled}
            className={`flex-1 rounded-2xl font-semibold !py-3.5 h-auto leading-none text-[13px] shadow-none ${primaryButton.className || (!primaryButton.danger ? "bg-primary-600 hover:bg-primary-500 border-none" : "")}`}
          >
            {primaryButton.label}
          </Button>

          {secondaryButton && (
            <Button
              type="default"
              size="large"
              onClick={secondaryButton.onClick || onClose}
              disabled={secondaryButton.disabled}
              className={`flex-1 rounded-2xl font-semibold !py-3.5 h-auto leading-none text-[13px] text-gray-400 border border-gray-100 bg-white hover:bg-gray-50 shadow-none ${secondaryButton.className || ""}`}
            >
              {secondaryButton.label}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ActionModal;
