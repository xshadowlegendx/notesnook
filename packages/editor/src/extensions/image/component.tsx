import { Box, Flex, Image } from "rebass";
import { ImageAlignmentOptions, ImageAttributes } from "./image";
import { Resizable } from "re-resizable";
import { useEffect, useRef } from "react";
import { SelectionBasedReactNodeViewProps } from "../react";
import { DesktopOnly } from "../../components/responsive";
import { Icon } from "../../toolbar/components/icon";
import { Icons } from "../../toolbar/icons";
import { ToolbarGroup } from "../../toolbar/components/toolbar-group";
import { useIsMobile } from "../../toolbar/stores/toolbar-store";

export function ImageComponent(
  props: SelectionBasedReactNodeViewProps<
    ImageAttributes & ImageAlignmentOptions
  >
) {
  const { editor, updateAttributes, node, selected } = props;
  const isMobile = useIsMobile();
  let { src, alt, title, width, height, align, float } = node.attrs;
  const imageRef = useRef<HTMLImageElement>();

  useEffect(() => {
    (async () => {
      if (!imageRef.current || !src) return;
      imageRef.current.src = await dataUriToBlobURL(src);
    })();
  }, [src, imageRef]);

  if (isMobile) float = false;

  return (
    <>
      <Box
        sx={{
          display: float ? "block" : "flex",
          justifyContent: float
            ? "stretch"
            : align === "center"
            ? "center"
            : align === "left"
            ? "start"
            : "end",
          ":hover .drag-handle, :active .drag-handle": {
            opacity: 1
          }
        }}
      >
        <Resizable
          enable={{
            bottom: false,
            left: false,
            right: false,
            top: false,
            bottomLeft: false,
            bottomRight: editor.isEditable && selected,
            topLeft: false,
            topRight: false
          }}
          handleComponent={{
            bottomRight: (
              <Icon
                sx={{
                  width: 25,
                  height: 25,
                  marginLeft: -17,
                  marginTop: -17,
                  borderTopLeftRadius: "default",
                  borderBottomRightRadius: "default"
                }}
                path={Icons.resize}
                size={25}
                color="primary"
              />
            )
          }}
          style={{
            position: "relative",
            float: float ? (align === "left" ? "left" : "right") : "none"
          }}
          size={{
            height: height || "auto",
            width: width || "auto"
          }}
          maxWidth="100%"
          onResizeStop={(e, direction, ref, d) => {
            updateAttributes(
              {
                width: ref.clientWidth,
                height: ref.clientHeight
              },
              { addToHistory: true, preventUpdate: false }
            );
          }}
          lockAspectRatio={true}
        >
          <DesktopOnly>
            {selected && (
              <Flex sx={{ position: "relative", justifyContent: "end" }}>
                <Flex
                  sx={{
                    position: "absolute",
                    top: -40,
                    mb: 2,
                    alignItems: "end"
                  }}
                >
                  <ToolbarGroup
                    editor={editor}
                    tools={[
                      "imageAlignLeft",
                      "imageAlignCenter",
                      "imageAlignRight",
                      "imageProperties"
                    ]}
                    sx={{
                      boxShadow: "menu",
                      borderRadius: "default",
                      bg: "background"
                    }}
                  />
                </Flex>
              </Flex>
            )}
          </DesktopOnly>
          {selected && (
            <Icon
              className="drag-handle"
              data-drag-handle
              draggable
              path={Icons.dragHandle}
              sx={{
                cursor: "grab",
                position: "absolute",
                top: 2,
                left: 2,
                zIndex: 999
              }}
            />
          )}
          <Image
            data-drag-image
            ref={imageRef}
            alt={alt}
            src="/placeholder.svg"
            title={title}
            width={"100%"}
            height={"100%"}
            sx={{
              bg: "bgSecondary",
              border: selected
                ? "2px solid var(--primary)"
                : "2px solid transparent",
              borderRadius: "default"
            }}
            {...props}
          />
        </Resizable>
      </Box>
    </>
  );
}

async function dataUriToBlobURL(dataurl: string) {
  if (!dataurl.startsWith("data:image")) return dataurl;

  const response = await fetch(dataurl);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
