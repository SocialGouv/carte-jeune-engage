import React, { useEffect, useState } from "react";
import { Edit } from "payload/components/views/Edit";

const UserCustomView = (props: any) => {
  const [couponsNumber, setCouponsNumber] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `/api/coupons?pagination=false&where[user][equals]=${props.id}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.docs?.length) {
          setCouponsNumber(data.docs.length);
        }
      }
    };

    if (props.id) fetchData();
  }, [props.id]);

  return (
    <Edit
      customHeader={
        <>
          <div
            style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
          >
            <h1
              className="doc-header__title render-title"
              title="0640169312@cje.loc"
            >
              {!props.isLoading ? props.data.email : ""}
            </h1>
            <div
              className="doc-header__actions"
              style={{ marginTop: "0.75rem" }}
            >
              <div className="doc-header__action">
                <span className="doc-controls__label">Nombre de coupons: </span>
                <span className="doc-controls__value">{couponsNumber}</span>
              </div>
            </div>
          </div>
          <div className="doc-tabs">
            <div className="doc-tabs__tabs-container">
              <ul className="doc-tabs__tabs">
                <li className="doc-tab doc-tab--active">
                  <a
                    className="doc-tab__link"
                    tabIndex={-1}
                    href="/admin/collections/coupons/1"
                  >
                    <span className="doc-tab__label">Edit</span>
                  </a>
                </li>
                <li className="doc-tab">
                  <a
                    className="doc-tab__link"
                    tabIndex={0}
                    href="/admin/collections/coupons/1/api"
                  >
                    <span className="doc-tab__label">API</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      }
      {...props}
    />
  );
};

export default UserCustomView;
