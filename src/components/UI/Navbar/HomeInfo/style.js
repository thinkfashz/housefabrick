import styled from "styled-components";

export const Row = styled.div`
  display: flex;
`;
export const Col = styled.div`
  flex-grow: 1;
`;
export const InfoItem = styled.div`
  text-align: center;
  padding: 16px 0;

  .label {
    margin-bottom: 8px;
  }

  .details {
    color: ${({ theme }) => theme.colors.ink.normal};
    font-weight: bold;
  }
`;
